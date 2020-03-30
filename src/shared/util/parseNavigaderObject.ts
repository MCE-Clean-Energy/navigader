import { NavigaderObject, RawNavigaderObject } from '@nav/shared/types';


/**
 * Parses a `RawNavigaderObject` into a `NavigaderObject`, which entails simply changing key names
 * 
 * @param {RawNavigaderObject} obj: the object to parse
 */
export function parseNavigaderObject <Type extends string>(
  obj: RawNavigaderObject<Type>
): NavigaderObject<Type> {
  return {
    created: obj.created_at,
    id: obj.id,
    objectType: obj.object_type,
    name: obj.name
  };
}
