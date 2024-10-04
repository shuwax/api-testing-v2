"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocationsAPI = void 0;
class LocationsAPI {
    constructor(apiService) {
        this.setApiService = (apiService) => {
            this.apiService = apiService;
        };
        this.getApiService = () => {
            return this.apiService;
        };
        this.getLocations = async () => {
            try {
                const { data } = await this.apiService
                    .getOpenApiClient()
                    .GET('/api/Locations');
                return data;
            }
            catch (error) {
                console.error('Error fetching locations:', error);
                return error;
            }
        };
        this.getLocationById = async (id) => {
            try {
                const { data } = await this.apiService
                    .getOpenApiClient()
                    .GET('/api/Locations/{id}', { params: { path: { id } } });
                return data;
            }
            catch (error) {
                console.error('Error fetching location:', error);
                return error;
            }
        };
        this.createLocation = async (body) => {
            try {
                const { data } = await this.apiService
                    .getOpenApiClient()
                    .POST('/api/Locations', { body });
                return data;
            }
            catch (error) {
                console.error('Error creating location:', error);
                return error;
            }
        };
        this.apiService = apiService;
    }
}
exports.LocationsAPI = LocationsAPI;
//# sourceMappingURL=index.js.map