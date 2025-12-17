import { z } from "zod";

const schema = z.object({
    name: z.string(),
    age: z.number().int().positive(),
});

const result = schema.safeParse({ name: "Test", age: 30 });

console.log(result.success ? "Zod funcionando" : result.error);
