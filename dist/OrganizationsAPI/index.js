"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationsAPI = void 0;
const index_js_1 = require("../AlarmsAPI/index.js");
const index_js_2 = require("../GroupsAPI/index.js");
const index_js_3 = require("../UsersAPI/index.js");
class OrganizationsAPI {
    constructor(apiService) {
        this.setApiService = (apiService) => {
            this.apiService = apiService;
        };
        this.getApiService = () => {
            return this.apiService;
        };
        this.createOrganization = async (body) => {
            try {
                const { data } = await this.apiService
                    .getOpenApiClient()
                    .POST('/api/Admin/Organizations/Create', { body });
                return data;
            }
            catch (error) {
                console.error('Error creating organization:', error);
                return error;
            }
        };
        this.getOrganizationById = async (id) => {
            try {
                const { data } = await this.apiService
                    .getOpenApiClient()
                    .GET('/api/Admin/Organizations/{id}', { params: { path: { id } } });
                return data;
            }
            catch (error) {
                console.error('Error creating organization:', error);
                return error;
            }
        };
        this.addUsersToOrganization = async (id, usersIds) => {
            try {
                await this.apiService
                    .getOpenApiClient()
                    .POST('/api/Admin/Organizations/{id}/AddUsers', {
                    params: { path: { id } },
                    body: usersIds,
                    parseAs: 'text',
                });
            }
            catch (error) {
                console.error('Error adding users to organization:', error);
                return error;
            }
        };
        this.removeUserFromSubOrganization = async (id, userId) => {
            try {
                await this.apiService
                    .getOpenApiClient()
                    .POST('/api/Admin/Organizations/{id}/RemoveUser/{userId}', {
                    params: { path: { id, userId } },
                    parseAs: 'text',
                });
            }
            catch (error) {
                console.error('Error removing user from organization:', error);
                return error;
            }
        };
        this.removeMultipleUsersFromSubOrganization = async (id, usersIds) => {
            try {
                await this.apiService
                    .getOpenApiClient()
                    .POST('/api/Admin/Organizations/{id}/RemoveUsers', {
                    params: { path: { id } },
                    body: usersIds,
                    parseAs: 'text',
                });
            }
            catch (error) {
                console.error('Error removing users from organization:', error);
                return error;
            }
        };
        this.deleteOrganization = async (id) => {
            try {
                await this.apiService
                    .getOpenApiClient()
                    .DELETE('/api/Admin/Organizations/{id}/Delete', {
                    params: { path: { id } },
                });
            }
            catch (error) {
                console.error('Error deleteing organization:', error);
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
                const groupsAPI = new index_js_2.GroupsAPI(this.apiService);
                const usersAPI = new index_js_3.UsersAPI(this.apiService);
                const alarmsAPI = new index_js_1.AlarmsAPI(this.apiService);
                const organizationGroups = await groupsAPI.getAdminPanelGroups({
                    OrgId: id,
                    IncludeSuborgs: true,
                });
                const organizationUsers = await usersAPI.getAdminPanelUsers({
                    organization: [id],
                    includeSuborgs: true,
                });
                const organizationEmergencyTypes = await alarmsAPI.getEmergencyTypesByOrganizationId(id);
                await usersAPI.deleteMultipleUsers(organizationUsers.map((user) => ({ userId: user.id })));
                await groupsAPI.deleteMultipleGroups(organizationGroups.map((group) => group.id));
                await alarmsAPI.deleteMultipleEmergencyTypes(organizationEmergencyTypes.map((type) => type.ID));
                await this.deleteOrganization(id);
            }
            catch (error) {
                console.error('Error force deleting organization:', error);
            }
        };
        this.apiService = apiService;
    }
}
exports.OrganizationsAPI = OrganizationsAPI;
//# sourceMappingURL=index.js.map