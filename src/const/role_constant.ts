const roles: Role[] = [
    { id: 1, name: "Admin", description: "Responsible for managing the system.", type: RoleType.Leader },
    { id: 2, name: "Editor", description: "Can edit and publish content.", type: RoleType.Good },
    { id: 3, name: "Viewer", description: "Can view content but cannot make changes.", type: RoleType.Good },
    { id: 4, name: "Contributor", description: "Can contribute new content.", type: RoleType.Bad },
    { id: 5, name: "Moderator", description: "Can moderate user comments and content.", type: RoleType.Bad },
    { id: 6, name: "Analyst", description: "Can view and analyze data.", type: RoleType.Good },
    { id: 7, name: "Guest", description: "Limited access to view content.", type: RoleType.Killer }
  ];