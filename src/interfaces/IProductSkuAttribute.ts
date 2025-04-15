import { IAttribute } from "./IAttribute";
import { IAttributeValue } from "./IAttributeValue";

export interface IProductSkuAttribute {
    id: number;
    skuId: number;
    attributeValueId: number;
    attribute: IAttribute;
    attributeValue: IAttributeValue;
}