type Route = {
  path: string;
  meta: { [key: string]: any };
  params: { [key: string]: any };
};

export default class Authorization {
  public static app({ route, roles }: { route: Route; roles: Array<string> }) {
    // route has allowed roles array
    if (Array.isArray(route.meta.rolesAllowed)) {
      if (route.meta.rolesAllowed.length) {
        if (route.meta.rolesAllowed.includes('*')) {
          // route allows any role
          return true;
        }

        // route has one or more allowed roles
        for (const role of route.meta.rolesAllowed) {
          if (roles.includes(role)) {
            return true;
          }
        }

        // user does not have any allowed roles
        return false;
      } else {
        // if route roles array is empty, user is authorized by default.
        return true;
      }
    } else {
      // if route doesn't define allowed roles, user is authorized by default.
      return true;
    }
  }

  public static user({
    route,
    user,
  }: {
    route: Route;
    user: { id: string; roles: Array<string> };
  }) {
    if (/^\/user\/\w+/.test(route.path)) {
      if (user.id !== route.params.id) {
        for (const role of user.roles) {
          if (['admin', 'super'].includes(role)) {
            return true;
          }
        }

        return false;
      } else {
        return true;
      }
    } else {
      return true;
    }
  }
}
