import { ClassConstructor, plainToInstance } from "class-transformer";
import { ValidatorOptions, validate, registerDecorator, ValidationOptions, ValidationArguments, ValidationError} from "class-validator";
import { ValidationError as CustomValidationError } from "./customErrors";


const reduceErrorMessages = (errs: ValidationError[]): string[] => {
  return errs.reduce((acc: string[], next) => {
    if (next.constraints) {
      for (const [_, msg] of Object.entries(next.constraints)) {
        acc.push(msg);
      }
    }

    if (next.children) {
      acc.push(...reduceErrorMessages(next.children));
    }
    return acc;
  }, []);
};

export const validator = async <T, V>(
  typedClass: ClassConstructor<T>,
  plain: V,
  config: ValidatorOptions = {}
) => {
  const toValidate = plainToInstance(typedClass, plain);
  // @ts-ignore
  const errors = await validate(toValidate, {
    whitelist: true,
    forbidNonWhitelisted: true,
    ...config,
  });

  if (errors.length > 0) {
    const errorMessages = reduceErrorMessages(errors);

    throw new CustomValidationError(
      errorMessages.join(", "),
    );
  }

  return toValidate;
};
