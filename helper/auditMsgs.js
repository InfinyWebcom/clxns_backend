const getAuditMessage = (name, data) => {
    var templateMessage = {}
    switch(name) {
        case "teamList":
            templateMessage = data.userName + " checked teams list" 
            break;
        case "createTeam":
            templateMessage = data.userName + " has created a team named " + data.teamName
            break;     
        case "viewTeamDetails":
            templateMessage = data.userName + " has viewed team " + data.teamName + "'s details"
            break;
        case "updateTeamDetails":
            templateMessage = data.userName + " has updated team " + data.teamName + "'s details"
            break;
        case "deactivateTeam":
            templateMessage = data.userName + " has deactivated team " + data.teamName
            break;
        case "activateTeam":
            templateMessage = data.userName + " has activated team " + data.teamName
            break;
        case "deleteFromTeam":
            templateMessage = data.userName + " has deleted members from team " + data.teamName
            break; 
        case "addToTeam":
            var memberString = "member"
            if (data.memberCount > 1) {
                memberString = "members"
            }
            templateMessage = data.userName + " has added " + data.memberCount + " " + memberString + " to team " + data.teamName
            break;
        case "viewUserDetails":
            templateMessage = data.userName + " has viewed " + data.memberName + "'s details from team " + data.teamName
            break; 
        case "createUser":
            templateMessage = data.userName + " has created a user named " + data.CreateUserName
            break;
        case "updateUserDetails":
            templateMessage = data.userName + " has updated user " + data.updateUserName + "'s details"
            break;
        case "changePassword":
            templateMessage = data.userName + " has been changed password of " + data.updateUserName + " user"
            break; 
        case "deleteUser":
            templateMessage = data.userName + " has been " + data.status+ " " + data.deleteUserName +" user"
            break;      
        default:
            templateMessage = ""
    }

    return templateMessage
}

module.exports = {
    getAuditMessage
}