"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlarmsAPI = void 0;
class AlarmsAPI {
    constructor(apiService) {
        this.createEmergencyType = async (body) => {
            try {
                const { data } = await this.apiService
                    .getOpenApiClient()
                    .POST('/api/Admin/EmergencyTypes', {
                    body,
                });
                return data;
            }
            catch (error) {
                console.error('Error creating emergency type:', error);
                return error;
            }
        };
        this.getEmergencyTypes = async () => {
            try {
                const { data } = await this.apiService
                    .getOpenApiClient()
                    .GET('/api/Account/EmergencyTypes');
                return data;
            }
            catch (error) {
                console.error('Error creating emergency type:', error);
                return error;
            }
        };
        this.getEmergencyTypesByOrganizationId = async (id) => {
            try {
                const { data } = await this.apiService
                    .getOpenApiClient()
                    .GET('/api/Admin/Organizations/{id}/EmergencyTypes', {
                    params: { path: { id } },
                });
                return data;
            }
            catch (error) {
                console.error('Error getting emergency types by organization:', error);
                return error;
            }
        };
        this.deleteMultipleEmergencyTypes = async (emergencyTypesIds) => {
            try {
                await this.apiService
                    .getOpenApiClient()
                    .DELETE('/api/Admin/EmergencyTypes', {
                    body: emergencyTypesIds,
                    parseAs: 'text',
                });
            }
            catch (error) {
                console.error('Error deleting emergency type:', error);
                return error;
            }
        };
        this.apiService = apiService;
    }
    setApiService(apiService) {
        this.apiService = apiService;
    }
}
exports.AlarmsAPI = AlarmsAPI;
//# sourceMappingURL=index.js.map