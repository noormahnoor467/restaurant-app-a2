import { useState } from 'react';
export function useForm(initial, validator) {
  const [values, setValues] = useState(initial),
    [errors, setErrors] = useState({});
  const setValue = (key, value) => {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };
  const validate = () => {
    const next = validator(values);
    setErrors(next);
    return Object.keys(next).length === 0;
  };
  const reset = (next = initial) => {
    setValues(next);
    setErrors({});
  };
  return { values, errors, setValue, validate, reset, setErrors };
}
