import { uniqueId } from 'lodash';

const Menuitems = [
  // Transaction items
  {
    id: uniqueId(),
    title: 'Invoice Registration',
    icon: 'solar:document-add-outline',
    href: '/transactions/invoiceReg',
  },
  {
    id: uniqueId(),
    title: 'MultiLevel Registration',
    icon: 'solar:documents-outline',
    href: '/transactions/MultiInvoiceReg',
  },
  {
    id: uniqueId(),
    title: 'Payment Preparation',
    icon: 'solar:card-send-outline',
    href: '/transactions/paymentPrep',
  },
  {
    id: uniqueId(),
    title: 'Payment Enquire',
    icon: 'solar:bill-check-outline',
    href: '/transactions/paymentEnquire',
  },
  {
    id: uniqueId(),
    title: 'Search',
    icon: 'solar:magnifer-outline',
    href: '/transactions/search',
  },

  // Master items
  {
    id: uniqueId(),
    title: 'Vendor',
    icon: 'solar:users-group-two-rounded-outline',
    href: '/master/vendor',
  },
  {
    id: uniqueId(),
    title: 'AirCraft',
    icon: 'solar:plain-2-outline',
    href: '/master/airCraft',
  },
  {
    id: uniqueId(),
    title: 'ScreenRights',
    icon: 'solar:shield-user-outline', // Using same icon as User Rights
    href: '/master/screenRights',
  },
  {
    id: uniqueId(),
    title: 'CostCenter',
    icon: 'solar:calculator-outline',
    href: '/master/costcenter',
  },
  {
    id: uniqueId(),
    title: 'Location',
    icon: 'solar:map-point-outline',
    href: '/master/location',
  },
  {
    id: uniqueId(),
    title: 'Common Admin',
    icon: 'solar:settings-outline',
    href: '/master/commonAdmin',
  },
  {
    id: uniqueId(),
    title: 'User Master',
    icon: 'solar:user-outline',
    href: '/master/userMaster',
  },
  {
    id: uniqueId(),
    title: 'User Rights',
    icon: 'solar:shield-user-outline',
    href: '/master/userRights',
  },
  {
    id: uniqueId(),
    title: 'Entity',
    icon: 'solar:buildings-outline',
    href: '/master/entity',
  },
];

export default Menuitems;
