import { z } from 'zod';

const MinMax = z.object({
    min : z.number().min( 0 ).max( 100 ),
    max : z.number().min( 0 ).max( 100 ),
}).refine( value => value.min <= value.max, { message : 'min must be less than or equal to max' });

export const Util = {
    MinMax,
}