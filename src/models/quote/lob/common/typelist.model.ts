import {Type, Exclude, plainToClass} from "class-transformer";

/**
 * Domain model for Personal Line Quoting and Services.
 * Object used to store Policy Address data.
 * @Author: Srinivas Rao (tcs_1979453)
 * Date: 8/1/2017
 * Time: 8:36 AM
 */
export class TypeList {
    name: string;
    @Type(() => Pair)
    typeCodes: Pair[];

}

export class Pair {
    value: string;
    label: string;

}