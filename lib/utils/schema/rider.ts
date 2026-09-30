import * as Yup from 'yup';

export const RiderSchema = Yup.object().shape({
  name: Yup.string()
    .max(35, 'Name cannot exceed 35 characters')
    .trim()
    .matches(/\S/, 'Name cannot be only spaces')
    .required('Name is required'),
  username: Yup.string()
    .min(2, 'Username must be at least 2 characters')
    .max(35, 'Username cannot exceed 35 characters')
    .required('Username is required'),
  password: Yup.string()
    .min(4, 'Password must be at least 4 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords do not match')
    .required('Confirm password is required'),
  zone: Yup.object()
    .nullable()
    .required('Please select a zone'),
  phone: Yup.string()
    .min(5, 'Minimum 5 numbers required')
    .required('Phone number is required'),
  vehicleType: Yup.object()
    .nullable()
    .required('Please select a vehicle type'),
});

export const EditRiderSchema = Yup.object().shape({
  name: Yup.string()
    .max(35, 'Name cannot exceed 35 characters')
    .trim()
    .matches(/\S/, 'Name cannot be only spaces')
    .required('Name is required'),
  username: Yup.string()
    .min(2, 'Username must be at least 2 characters')
    .max(35, 'Username cannot exceed 35 characters')
    .required('Username is required'),
  password: Yup.string()
    .nullable()
    .notRequired(),
  confirmPassword: Yup.string()
    .nullable()
    .when('password', {
      is: (val: any) => typeof val === 'string' && val.length > 0,
      then: (schema) => schema.oneOf([Yup.ref('password'), null], 'Passwords do not match').required('Confirm password is required'),
      otherwise: (schema) => schema.notRequired(),
    }),
  zone: Yup.object()
    .nullable()
    .required('Please select a zone'),
  phone: Yup.string()
    .min(5, 'Minimum 5 numbers required')
    .required('Phone number is required'),
  vehicleType: Yup.object()
    .nullable()
    .required('Please select a vehicle type'),
});