export const ApiUrls = {
  Lookup: {
    GetLookupTypes: 'Lookup/GetLookupTypes',
    AddLookupType: 'Lookup/AddLookupType',
    EditLookupType: 'Lookup/EditLookupType',
    DeleteLookupType: 'Lookup/DeleteLookupType',
    GetLookups: 'Lookup/GetLookups',
    AddLookup: 'Lookup/AddLookup',
    EditLookup: 'Lookup/EditLookup',
    DeleteLookup: 'Lookup/DeleteLookup',
    GetLookupsFull: 'Lookup/GetLookupsFull',
  },
  MasterPages: {
    AddMasterPages: 'MasterPages/AddMasterPages',
    EditMasterPages: 'MasterPages/EditMasterPages',
    DeleteMasterPages: 'MasterPages/DeleteMasterPages',
    GetMasterPages: 'MasterPages/GetMasterPages',
  },
  ContactsSM: {
    AddContacts: 'ContactsAndSocialMedia/AddContacts',
    EditContacts: 'ContactsAndSocialMedia/EditContacts',
    DeleteContacts: 'ContactsAndSocialMedia/DeleteContacts',
    GetContacts: 'ContactsAndSocialMedia/GetContacts',

    AddSocialMedia: 'ContactsAndSocialMedia/AddSocialMedia',
    EditSocialMedia: 'ContactsAndSocialMedia/EditSocialMedia',
    DeleteSocialMedia: 'ContactsAndSocialMedia/DeleteSocialMedia',
    GetSocialMedia: 'ContactsAndSocialMedia/GetSocialMedia',

    AddAddress: 'ContactsAndSocialMedia/AddAddress',
    EditAddress: 'ContactsAndSocialMedia/EditAddress',
    DeleteAddress: 'ContactsAndSocialMedia/DeleteAddress',
    GetAddress: 'ContactsAndSocialMedia/GetAddress',
  },
  User: {
    Login: 'User/Login',
    AddUser: 'User/AddUser',
    EditUser: 'User/EditUser',
    DeleteUser: 'User/DeleteUser',
    GetUsers: 'User/GetUsers',
    GetUserMenuOptions: 'User/GetUserMenuOptions',
  },
  Customers: {
    AddCustomer: 'Customers/AddCustomer',
    GetCustomers: 'Customers/GetCustomers',
    UpdateCustomerProfile: 'Customers/UpdateCustomerProfile',
    BlockCustomers: 'Customers/BlockCustomers',
  },
  Notifications: {
    SendNotification: 'Notifications/SendNotification',
  },
  Wallet: {
    ViewDriverReceivedAmounts: 'Wallet/ViewDriverReceivedAmounts',
    ViewDriverWalletDetails: 'Wallet/ViewDriverWalletDetails',
    AddMoneyToDriverWallet: 'Wallet/AddMoneyToDriverWallet',
  },
  Orders: {
    AddOrder: 'Orders/AddOrder',
    EditOrder: 'Orders/EditOrder',
    GetOrders: 'Orders/GetOrders',
    DeleteOrders: 'Orders/DeleteOrders',
    GetOrderStatusLog: 'Orders/GetOrderStatusLog',
  },
  Dashboard: {
    GetOrdersCount: 'Dashboard/GetOrdersCount',
    GetRegistrationsByYear: 'Dashboard/GetRegistrationsByYear',
    GetCompanyIncome: 'Dashboard/GetCompanyIncome',
  },
}
