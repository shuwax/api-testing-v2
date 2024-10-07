// src/ApiService/index.ts
import createOpenAPIClient from "openapi-fetch";
import * as qs from "qs";

// src/ApiService/helpers.ts
var createError = (error, response) => {
  console.log("createError", error, response);
};
var getRequestHeaders = (csrfToken, cookies) => {
  return {
    "Content-Type": "application/json",
    ...!!csrfToken && { "X-XSRF-TOKEN": csrfToken },
    ...cookies?.length && {
      Cookie: `${cookies.join(";")}`
    }
  };
};

// src/ApiService/index.ts
var emptyResponseStatuses = [200, 204];
var ApiService = class {
  constructor(baseUrl, clientType = 1 /* Web */) {
    this.openApiClient = void 0;
    this.csrfToken = void 0;
    this.cookies = void 0;
    this.baseUrl = baseUrl;
    this.clientType = clientType;
    this.openApiClient = this.createClient({ baseUrl });
  }
  async makeRequest({
    method,
    path,
    options
  }) {
    try {
      const requestOptions = {
        ...options,
        headers: options?.headers ?? this.getRequestHeaders()
      };
      const res = await this.openApiClient[method](path, {
        ...requestOptions
      });
      const { data, response, error } = res;
      if (error) {
        throw error;
      }
      return { data, response };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  getOpenApiClient() {
    return this.openApiClient;
  }
  getBaseUrl() {
    return this.baseUrl;
  }
  getCSRFToken() {
    return this.csrfToken;
  }
  getCookies() {
    return this.cookies;
  }
  getClientType() {
    return this.clientType;
  }
  getRequestHeaders(includeCsrfToken = true, includeCookies = true) {
    return {
      ...includeCsrfToken && this.csrfToken && { "X-XSRF-TOKEN": this.csrfToken },
      ...includeCookies && this.cookies && {
        Cookie: `${this.cookies.join(";")}`
      }
    };
  }
  createClient(clientOptions) {
    const options = {
      querySerializer: (query) => {
        return qs.stringify(query, { arrayFormat: "repeat" });
      }
    };
    const client = createOpenAPIClient({
      ...options,
      ...clientOptions
    });
    const csrfToken = () => this.csrfToken;
    const cookies = () => this.cookies;
    function addAuthorizationHeader(options2) {
      const updatedHeaders = options2?.headers ?? getRequestHeaders(csrfToken(), cookies());
      return {
        ...options2,
        headers: updatedHeaders
      };
    }
    return {
      async GET(url, init) {
        const { data, error, response } = await client.GET(
          url,
          addAuthorizationHeader(init)
        );
        if (data || emptyResponseStatuses.includes(response?.status)) {
          return { data, response };
        }
        throw createError(error, response);
      },
      async PUT(url, init) {
        const { data, error, response } = await client.PUT(
          url,
          addAuthorizationHeader(init)
        );
        if (data || emptyResponseStatuses.includes(response?.status)) {
          return { data, response };
        }
        throw createError(error, response);
      },
      async POST(url, init) {
        const { data, error, response } = await client.POST(
          url,
          addAuthorizationHeader(init)
        );
        if (data || emptyResponseStatuses.includes(response?.status)) {
          return { data, response };
        }
        throw createError(error, response);
      },
      async DELETE(url, init) {
        const { data, error, response } = await client.DELETE(
          url,
          addAuthorizationHeader(init)
        );
        if (data || emptyResponseStatuses.includes(response?.status)) {
          return { data, response };
        }
        throw createError(error, response);
      }
    };
  }
  setBaseUrl(baseUrl) {
    this.baseUrl = baseUrl;
    this.openApiClient = this.createClient({ baseUrl });
  }
  setCSRFToken(csrfToken) {
    this.csrfToken = csrfToken;
  }
  setCookies(cookies) {
    this.cookies = cookies;
  }
  setClientType(clientType) {
    this.clientType = clientType;
  }
};

// src/AccountAPI/index.ts
var AccountAPI = class {
  constructor(apiService) {
    this.setApiService = (apiService) => {
      this.apiService = apiService;
    };
    this.getApiService = () => {
      return this.apiService;
    };
    this.getAntiForgeryToken = async () => {
      try {
        const { data, response } = await this.apiService.getOpenApiClient().GET("/api/Account/AntiForgeryToken");
        const token = data.requestVerificationToken;
        const cookie = response.headers.get("set-cookie");
        if (!this.apiService.getCookies()?.length) {
          if (cookie) this.apiService.setCookies([cookie]);
        }
        if (token) this.apiService.setCSRFToken(token);
        return { token, cookie };
      } catch (error) {
        console.error("Error fetching AntiForgeryToken:", error);
        return error;
      }
    };
    this.loginByEmailAndPassword = async (body) => {
      try {
        const { data, response } = await this.apiService.getOpenApiClient().POST("/api/Account/Login", { body });
        const cookies = response.headers.get("set-cookie");
        this.apiService.setCookies([...this.apiService.getCookies(), cookies]);
        await this.getAntiForgeryToken();
        console.log("Logged in");
        return data;
      } catch (error) {
        console.error("Error logging in:", error);
        return error;
      }
    };
    this.loginAdminByEmailAndPassword = async (body) => {
      try {
        const bodyData = { ...body };
        if (!bodyData.language) bodyData.language = "en";
        const { data, response } = await this.apiService.getOpenApiClient().POST("/api/Account/LoginAdmin", { body: bodyData });
        const dataObject = data;
        const code = dataObject?.code;
        if (code) {
          return this.loginAdminByEmailAndPassword({ ...body, code });
        }
        const cookies = response.headers.get("set-cookie");
        this.apiService.setCookies([...this.apiService.getCookies(), cookies]);
        await this.getAntiForgeryToken();
        console.log("Logged in");
        return data;
      } catch (error) {
        console.error("Error admin logging in:", error);
        return error;
      }
    };
    this.getUserInfo = async () => {
      try {
        const { data } = await this.apiService.getOpenApiClient().GET("/api/Account/Info");
        return data;
      } catch (error) {
        console.error("Error getting user info:", error);
        return error;
      }
    };
    this.logout = async (query) => {
      try {
        await this.apiService.getOpenApiClient().POST("/api/Account/Logout", {
          params: { query }
        });
        this.apiService.setCookies([]);
        await this.getAntiForgeryToken();
        console.log("Logout successful");
      } catch (error) {
        console.error("Error logging out:", error);
        return error;
      }
    };
    this.apiService = apiService;
  }
};

// src/GroupsAPI/index.ts
var GroupsAPI = class {
  constructor(apiService) {
    this.setApiService = (apiService) => {
      this.apiService = apiService;
    };
    this.getApiService = () => {
      return this.apiService;
    };
    this.registerGroup = async (body) => {
      try {
        const { data } = await this.apiService.getOpenApiClient().POST("/api/Admin/Groups/Register", { body });
        return data;
      } catch (error) {
        console.error("Error registering group:", error);
        return error;
      }
    };
    this.addGroupMember = async (id, body) => {
      try {
        const { data } = await this.apiService.getOpenApiClient().POST("/api/Admin/Groups/{id}/addMember", {
          params: { path: { id } },
          body
        });
        return data;
      } catch (error) {
        console.error("Error registering group:", error);
        return error;
      }
    };
    this.addMultipleGroupMembers = async (body) => {
      try {
        const { data } = await this.apiService.getOpenApiClient().POST("/api/Admin/Groups/addMembers", {
          body
        });
        return data;
      } catch (error) {
        console.error("Error registering group:", error);
        return error;
      }
    };
    this.deleteGroup = async (id) => {
      try {
        await this.apiService.getOpenApiClient().DELETE("/api/Admin/Groups/{id}/delete", {
          params: { path: { id } },
          parseAs: "text"
        });
      } catch (error) {
        console.error("Error registering group:", error);
        return error;
      }
    };
    this.deleteMultipleGroups = async (groupsIds) => {
      try {
        if (!groupsIds.length) return;
        await this.apiService.getOpenApiClient().DELETE("/api/Admin/Groups", {
          body: groupsIds,
          parseAs: "text"
        });
      } catch (error) {
        console.error("Error registering group:", error);
        return error;
      }
    };
    //We can use it also like this -> query?: QueryParameters<'/api/Groups', 'get'>
    this.getGroups = async (query) => {
      try {
        const { data } = await this.apiService.getOpenApiClient().GET("/api/Groups", { params: { query } });
        return data;
      } catch (error) {
        console.error("Error fetching groups:", error);
        return error;
      }
    };
    this.getAdminPanelGroups = async (query) => {
      try {
        const { data } = await this.apiService.getOpenApiClient().GET("/api/Admin/Groups/All", { params: { query } });
        return data?.groups ?? [];
      } catch (error) {
        console.error("Error fetching groups:", error);
        return error;
      }
    };
    this.getGroupById = async (id) => {
      try {
        const { data } = await this.apiService.getOpenApiClient().GET("/api/Groups/{id}", { params: { path: { id } } });
        return data;
      } catch (error) {
        console.error("Error fetching group by id:", error);
        return error;
      }
    };
    //We can use it also like this -> query?: QueryParameters<'/api/Groups/{id}/members', 'get'>
    this.getGroupMembers = async (id, query) => {
      try {
        const { data } = await this.apiService.getOpenApiClient().GET("/api/Groups/{id}/members", { params: { path: { id }, query } });
        return data;
      } catch (error) {
        console.error("Error fetching group members:", error);
        return error;
      }
    };
    this.getGroupLocations = async (id) => {
      try {
        const { data } = await this.apiService.getOpenApiClient().GET("/api/Groups/{id}/locations", { params: { path: { id } } });
        return data;
      } catch (error) {
        console.error("Error fetching group locations:", error);
        return error;
      }
    };
    this.apiService = apiService;
  }
};

// src/LocationsAPI/index.ts
var LocationsAPI = class {
  constructor(apiService) {
    this.setApiService = (apiService) => {
      this.apiService = apiService;
    };
    this.getApiService = () => {
      return this.apiService;
    };
    this.getLocations = async () => {
      try {
        const { data } = await this.apiService.getOpenApiClient().GET("/api/Locations");
        return data;
      } catch (error) {
        console.error("Error fetching locations:", error);
        return error;
      }
    };
    this.getLocationById = async (id) => {
      try {
        const { data } = await this.apiService.getOpenApiClient().GET("/api/Locations/{id}", { params: { path: { id } } });
        return data;
      } catch (error) {
        console.error("Error fetching location:", error);
        return error;
      }
    };
    this.createLocation = async (body) => {
      try {
        const { data } = await this.apiService.getOpenApiClient().POST("/api/Locations", { body });
        return data;
      } catch (error) {
        console.error("Error creating location:", error);
        return error;
      }
    };
    this.apiService = apiService;
  }
};

// src/AlarmsAPI/index.ts
var AlarmsAPI = class {
  constructor(apiService) {
    this.createEmergencyType = async (body) => {
      try {
        const { data } = await this.apiService.getOpenApiClient().POST("/api/Admin/EmergencyTypes", {
          body
        });
        return data;
      } catch (error) {
        console.error("Error creating emergency type:", error);
        return error;
      }
    };
    this.getEmergencyTypes = async () => {
      try {
        const { data } = await this.apiService.getOpenApiClient().GET("/api/Account/EmergencyTypes");
        return data;
      } catch (error) {
        console.error("Error creating emergency type:", error);
        return error;
      }
    };
    this.getEmergencyTypesByOrganizationId = async (id) => {
      try {
        const { data } = await this.apiService.getOpenApiClient().GET("/api/Admin/Organizations/{id}/EmergencyTypes", {
          params: { path: { id } }
        });
        return data;
      } catch (error) {
        console.error("Error getting emergency types by organization:", error);
        return error;
      }
    };
    this.deleteMultipleEmergencyTypes = async (emergencyTypesIds) => {
      try {
        await this.apiService.getOpenApiClient().DELETE("/api/Admin/EmergencyTypes", {
          body: emergencyTypesIds,
          parseAs: "text"
        });
      } catch (error) {
        console.error("Error deleting emergency type:", error);
        return error;
      }
    };
    this.apiService = apiService;
  }
  setApiService(apiService) {
    this.apiService = apiService;
  }
};

// src/UsersAPI/index.ts
var UsersAPI = class {
  constructor(apiService) {
    this.registerUser = async (body) => {
      try {
        const { data } = await this.apiService.getOpenApiClient().POST("/api/Admin/Users/Register", { body });
        return data;
      } catch (error) {
        console.error("Error registering user:", error);
        return error;
      }
    };
    this.changeUsersPassword = async (id, body) => {
      try {
        await this.apiService.getOpenApiClient().POST("/api/Admin/Users/{id}/changePassword", {
          body,
          params: { path: { id } },
          parseAs: "text"
        });
      } catch (error) {
        console.error("Error registering users:", error);
        return error;
      }
    };
    this.registerUserAndSetPassword = async (body) => {
      try {
        const userData = await this.registerUser(body);
        if (userData?.id) {
          await this.changeUsersPassword(userData.id, {
            password: body.password
          });
        }
        return userData;
      } catch (error) {
        console.error("Error registering user and setting password:", error);
        return error;
      }
    };
    this.registerMultipleUsers = async (users) => {
      try {
        const result = await Promise.all(
          users.map((user) => this.registerUserAndSetPassword(user))
        );
        return result;
      } catch (error) {
        console.error("Error registering users:", error);
        return error;
      }
    };
    this.getUsers = async (query) => {
      try {
        const { data } = await this.apiService.getOpenApiClient().GET("/api/Users", { params: { query } });
        return data;
      } catch (error) {
        console.error("Error fetching users:", error);
        return error;
      }
    };
    this.getUserById = async (id) => {
      try {
        const { data } = await this.apiService.getOpenApiClient().GET("/api/Users/{id}", { params: { path: { id } } });
        return data;
      } catch (error) {
        console.error("Error fetching user by id:", error);
        return error;
      }
    };
    this.getAdminPanelUsers = async (query) => {
      try {
        const { data } = await this.apiService.getOpenApiClient().GET("/api/Admin/Users/accounts", { params: { query } });
        return data?.users ?? [];
      } catch (error) {
        console.error("Error fetching groups:", error);
        return error;
      }
    };
    this.deleteUser = async (id, body) => {
      try {
        await this.apiService.getOpenApiClient().DELETE("/api/Admin/Users/{id}/delete", {
          body,
          params: { path: { id } },
          parseAs: "text"
        });
      } catch (error) {
        console.error("Error deleting user:", error);
        return error;
      }
    };
    this.deleteMultipleUsers = async (users) => {
      try {
        if (!users.length) return;
        await this.apiService.getOpenApiClient().DELETE("/api/Admin/Users/delete", {
          body: users,
          parseAs: "text"
        });
      } catch (error) {
        console.error("Error deleting users:", error);
        return error;
      }
    };
    this.apiService = apiService;
  }
  setApiService(apiService) {
    this.apiService = apiService;
  }
};

// src/OrganizationsAPI/index.ts
var OrganizationsAPI = class {
  constructor(apiService) {
    this.setApiService = (apiService) => {
      this.apiService = apiService;
    };
    this.getApiService = () => {
      return this.apiService;
    };
    this.createOrganization = async (body) => {
      try {
        const { data } = await this.apiService.getOpenApiClient().POST("/api/Admin/Organizations/Create", { body });
        return data;
      } catch (error) {
        console.error("Error creating organization:", error);
        return error;
      }
    };
    this.getOrganizationById = async (id) => {
      try {
        const { data } = await this.apiService.getOpenApiClient().GET("/api/Admin/Organizations/{id}", { params: { path: { id } } });
        return data;
      } catch (error) {
        console.error("Error creating organization:", error);
        return error;
      }
    };
    this.addUsersToOrganization = async (id, usersIds) => {
      try {
        await this.apiService.getOpenApiClient().POST("/api/Admin/Organizations/{id}/AddUsers", {
          params: { path: { id } },
          body: usersIds,
          parseAs: "text"
        });
      } catch (error) {
        console.error("Error adding users to organization:", error);
        return error;
      }
    };
    this.removeUserFromSubOrganization = async (id, userId) => {
      try {
        await this.apiService.getOpenApiClient().POST("/api/Admin/Organizations/{id}/RemoveUser/{userId}", {
          params: { path: { id, userId } },
          parseAs: "text"
        });
      } catch (error) {
        console.error("Error removing user from organization:", error);
        return error;
      }
    };
    this.removeMultipleUsersFromSubOrganization = async (id, usersIds) => {
      try {
        await this.apiService.getOpenApiClient().POST("/api/Admin/Organizations/{id}/RemoveUsers", {
          params: { path: { id } },
          body: usersIds,
          parseAs: "text"
        });
      } catch (error) {
        console.error("Error removing users from organization:", error);
        return error;
      }
    };
    this.deleteOrganization = async (id) => {
      try {
        await this.apiService.getOpenApiClient().DELETE("/api/Admin/Organizations/{id}/Delete", {
          params: { path: { id } }
        });
      } catch (error) {
        console.error("Error deleteing organization:", error);
        return error;
      }
    };
    // TODO: Ask BE if I need to delete EmergencyTypes before deleting Organization
    /**
     * forceDeleteOrganization
     *
     * Completely removes an organization, including its associated groups, users, and emergency types.
     *
     * @param {string} organizationId - The ID of the organization to delete
     */
    this.forceDeleteOrganization = async (id) => {
      try {
        const groupsAPI = new GroupsAPI(this.apiService);
        const usersAPI = new UsersAPI(this.apiService);
        const alarmsAPI = new AlarmsAPI(this.apiService);
        const organizationGroups = await groupsAPI.getAdminPanelGroups({
          OrgId: id,
          IncludeSuborgs: true
        });
        const organizationUsers = await usersAPI.getAdminPanelUsers({
          organization: [id],
          includeSuborgs: true
        });
        const organizationEmergencyTypes = await alarmsAPI.getEmergencyTypesByOrganizationId(id);
        await usersAPI.deleteMultipleUsers(
          organizationUsers.map((user) => ({ userId: user.id }))
        );
        await groupsAPI.deleteMultipleGroups(
          organizationGroups.map((group) => group.id)
        );
        await alarmsAPI.deleteMultipleEmergencyTypes(
          organizationEmergencyTypes.map((type) => type.ID)
        );
        await this.deleteOrganization(id);
      } catch (error) {
        console.error("Error force deleting organization:", error);
      }
    };
    this.apiService = apiService;
  }
};
export {
  AccountAPI,
  AlarmsAPI,
  ApiService,
  GroupsAPI,
  LocationsAPI,
  OrganizationsAPI,
  UsersAPI
};
