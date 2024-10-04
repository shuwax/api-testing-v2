"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupsAPI = void 0;
class GroupsAPI {
    constructor(apiService) {
        this.setApiService = (apiService) => {
            this.apiService = apiService;
        };
        this.getApiService = () => {
            return this.apiService;
        };
        this.registerGroup = async (body) => {
            try {
                const { data } = await this.apiService
                    .getOpenApiClient()
                    .POST('/api/Admin/Groups/Register', { body });
                return data;
            }
            catch (error) {
                console.error('Error registering group:', error);
                return error;
            }
        };
        this.addGroupMember = async (id, body) => {
            try {
                const { data } = await this.apiService
                    .getOpenApiClient()
                    .POST('/api/Admin/Groups/{id}/addMember', {
                    params: { path: { id } },
                    body,
                });
                return data;
            }
            catch (error) {
                console.error('Error registering group:', error);
                return error;
            }
        };
        this.addMultipleGroupMembers = async (body) => {
            try {
                const { data } = await this.apiService
                    .getOpenApiClient()
                    .POST('/api/Admin/Groups/addMembers', {
                    body,
                });
                return data;
            }
            catch (error) {
                console.error('Error registering group:', error);
                return error;
            }
        };
        this.deleteGroup = async (id) => {
            try {
                await this.apiService
                    .getOpenApiClient()
                    .DELETE('/api/Admin/Groups/{id}/delete', {
                    params: { path: { id } },
                    parseAs: 'text',
                });
            }
            catch (error) {
                console.error('Error registering group:', error);
                return error;
            }
        };
        this.deleteMultipleGroups = async (groupsIds) => {
            try {
                if (!groupsIds.length)
                    return;
                await this.apiService.getOpenApiClient().DELETE('/api/Admin/Groups', {
                    body: groupsIds,
                    parseAs: 'text',
                });
            }
            catch (error) {
                console.error('Error registering group:', error);
                return error;
            }
        };
        //We can use it also like this -> query?: QueryParameters<'/api/Groups', 'get'>
        this.getGroups = async (query) => {
            try {
                const { data } = await this.apiService
                    .getOpenApiClient()
                    .GET('/api/Groups', { params: { query } });
                return data;
            }
            catch (error) {
                console.error('Error fetching groups:', error);
                return error;
            }
        };
        this.getAdminPanelGroups = async (query) => {
            try {
                const { data } = await this.apiService
                    .getOpenApiClient()
                    .GET('/api/Admin/Groups/All', { params: { query } });
                return data?.groups ?? [];
            }
            catch (error) {
                console.error('Error fetching groups:', error);
                return error;
            }
        };
        this.getGroupById = async (id) => {
            try {
                const { data } = await this.apiService
                    .getOpenApiClient()
                    .GET('/api/Groups/{id}', { params: { path: { id } } });
                return data;
            }
            catch (error) {
                console.error('Error fetching group by id:', error);
                return error;
            }
        };
        //We can use it also like this -> query?: QueryParameters<'/api/Groups/{id}/members', 'get'>
        this.getGroupMembers = async (id, query) => {
            try {
                const { data } = await this.apiService
                    .getOpenApiClient()
                    .GET('/api/Groups/{id}/members', { params: { path: { id }, query } });
                return data;
            }
            catch (error) {
                console.error('Error fetching group members:', error);
                return error;
            }
        };
        this.getGroupLocations = async (id) => {
            try {
                const { data } = await this.apiService
                    .getOpenApiClient()
                    .GET('/api/Groups/{id}/locations', { params: { path: { id } } });
                return data;
            }
            catch (error) {
                console.error('Error fetching group locations:', error);
                return error;
            }
        };
        this.apiService = apiService;
    }
}
exports.GroupsAPI = GroupsAPI;
//# sourceMappingURL=index.js.map