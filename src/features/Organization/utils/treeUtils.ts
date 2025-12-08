import {
  type Organization,
  type FlatOrgOption,
} from "@/features/Organization/types";

/**
 * تبدیل درخت تو در تو به یک لیست خطی (Flat List)
 * کاربرد: برای نمایش در سلکت‌باکس‌ها یا جستجو
 */
export const flattenOrganizations = (
  orgs: Organization[],
  level = 0
): FlatOrgOption[] => {
  let flatList: FlatOrgOption[] = [];
  for (const org of orgs) {
    flatList.push({
      id: org.id,
      name: org.name,
      level: level,
      parent_id: org.parent_id,
    });
    if (org.children && org.children.length > 0) {
      flatList = flatList.concat(flattenOrganizations(org.children, level + 1));
    }
  }
  return flatList;
};

/**
 * دریافت تمام IDهای فرزندان، نوه‌ها و نبیره‌های یک نود.
 * کاربرد: جلوگیری از انتخاب فرزند به عنوان والد خود (Circular Dependency Protection)
 */
export const getAllDescendantIds = (org: Organization): number[] => {
  let ids: number[] = [];
  if (org.children && org.children.length > 0) {
    for (const child of org.children) {
      ids.push(child.id);
      ids = ids.concat(getAllDescendantIds(child));
    }
  }
  return ids;
};
