# API Testing Library

This package provides a set of classes and methods to interact with an API that performs authentication and other account-related operations to prepare data for E2E tests.

## How to use it?

**Step 1: Initialize `ApiService`**

Before interacting with any of the API classes, you need to initialize the `ApiService`. This class is responsible for handling requests to the API. This class stores globally necessary things like `api url`, `csrfToken`, `cookies` and `openApiClient`

```shell
const apiService = new ApiService(BASE_URL);
```

**Step 2: Initialize Other Classes**

Once `ApiService` has been defined, you can now initialize other classes like `AccountAPI`. This class relies on `ApiService` to send requests.

```shell
const accountsAPI = new AccountAPI(apiService);
```

**Step 3: Call functions from defined classes**

After class initialization you can use functions defined in clases.

```shell
await accountsAPI.getAntiForgeryToken();
```

## Example setup for each E2E Test

```shell
/* Assigning classes */
const apiService = new ApiService(BASE_URL);
const accountsAPI = new AccountAPI(apiService);
const groupsAPI = new GroupsAPI(apiService);
const usersAPI = new UsersAPI(apiService);
const organizationsAPI = new OrganizationsAPI(apiService);

/* 1.Step - Get AntiForgeryToken and Cookies */
 await accountsAPI.getAntiForgeryToken();

/* 2.Step - Login as SuperAdmin */
await accountsAPI.loginAdminByEmailAndPassword(userCredentials);

/* 3.Step - Create Organization */
 const organization = await organizationsAPI.createOrganization({
      name: 'E2E Test Organization',
      HasUserLimit: true,
      UserLimit: 10,
});

/* 4.Step - Create users */
const organizationUsers = await usersAPI.registerMultipleUsers(
      Array.from({ length: 3 }, (_, i) => ({
        name: `E2E Test User ${i + 1}`,
        email: `e2eTestUser${i + 1}@example.com`,
        organizationIDs: [organization.id],
        password: 'Test12345@',
      }))
);

/* 5.Step - Create groups */
const organizationGroups = await Promise.all(
      Array.from({ length: 3 }, (_, i) =>
        groupsAPI.registerGroup({
          name: `E2E Test Group ${i + 1}`,
          organizationID: organization.id,
          latitude: 56.162868,
          longitude: 15.586335,
        })
      )
);

/* 6.Step - Add users to groups */
const usersGroups = [];
organizationGroups.forEach((group) => {
  organizationUsers.forEach((user) => {
    usersGroups.push({
      groupId: group.id,
      Id: user.id,
    });
  });
});

await groupsAPI.addMultipleGroupMembers(usersGroups);
```

## Example teardown for each E2E Test

```shell
 await organizationsAPI.forceDeleteOrganization(organization.id);
 await accountsAPI.logout();
```
