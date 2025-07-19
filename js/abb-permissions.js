const ABB_ACTIONS = {
    CREATE_FC: "CREATE_FIDELITY_CARD",
    SEARCH_FC: "SEARCH_FIDELITY_CARD",
    CHECKIN_FC: "CHECKIN_FIDELITY_CARD",
    CREATE_SURVEY: "CREATE_SURVEY",
    CREATE_USERS: "CREATE_USERS",
    EDIT_CHAT_SESSIONS: "EDIT_CHAT_SESSIONS",
};
  
const ABB_ROLES = {
    ADMIN: 600,
    EMPL1: 100,
};

const ABB_PERMISSIONS_MAP = new Map();

ABB_PERMISSIONS_MAP.set(ABB_ACTIONS.CREATE_FC, [ABB_ROLES.ADMIN, ABB_ROLES.EMPL1]);
ABB_PERMISSIONS_MAP.set(ABB_ACTIONS.SEARCH_FC, [ABB_ROLES.ADMIN, ABB_ROLES.EMPL1]);
ABB_PERMISSIONS_MAP.set(ABB_ACTIONS.CHECKIN_FC, [ABB_ROLES.ADMIN, ABB_ROLES.EMPL1]);
ABB_PERMISSIONS_MAP.set(ABB_ACTIONS.CREATE_SURVEY, [ABB_ROLES.ADMIN]);
ABB_PERMISSIONS_MAP.set(ABB_ACTIONS.CREATE_USERS, [ABB_ROLES.ADMIN]);
ABB_PERMISSIONS_MAP.set(ABB_ACTIONS.EDIT_CHAT_SESSIONS, [ABB_ROLES.ADMIN])

const ABB_PERMISSIONS_ROUTES = [
    {
        url_pattern: /.+\/survey-create.html?.+/,
        permission_action: ABB_ACTIONS.CREATE_SURVEY
    },
    {
        url_pattern: /.+\/sign-up.html?.+/,
        permission_action: ABB_ACTIONS.CREATE_USERS
    },
    {
        url_pattern: /.+\/fidelity-create.html?.+/,
        permission_action: ABB_ACTIONS.CREATE_FC
    },
    {
        url_pattern: /.+\/fidelity-search.html?.+/,
        permission_action: ABB_ACTIONS.SEARCH_FC
    },
    {
        url_pattern: /.+\/fidelity-checkin.html?.+/,
        permission_action: ABB_ACTIONS.CHECKIN_FC
    },
    {
        url_pattern: /.+\/chat-sessions.html?.+/,
        permission_action: ABB_ACTIONS.EDIT_CHAT_SESSIONS
    }
]

/*
    The user should have at least one of the role required 
    for the action
*/
function hasPermission(userClaims, action) {

    if(userClaims == undefined){
        return false
    }

    if (userClaims instanceof Array && userClaims.length == 0) {
      return false;
    }
  
    if (ABB_PERMISSIONS_MAP.has(action)) {
      let permissions = ABB_PERMISSIONS_MAP.get(action)
      return userClaims.some(claim => permissions.includes(claim))
    }
  
    return false;
  }
  