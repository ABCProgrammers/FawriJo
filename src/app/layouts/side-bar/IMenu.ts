export interface IMenu {
  id?: string;
  name?: string;
  iconLight?: string;
  iconDark?: string;
  routeName?: string;
  hasSubMenu?: boolean,
  subMenu?: any[],
}
