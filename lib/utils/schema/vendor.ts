import * as Yup from 'yup';
import { IDropdownSelectItem } from '../interfaces';

export const VendorSchema = Yup.object().shape({
  firstName: Yup.string()
    .max(35)
    .trim()
    .matches(/\S/, 'First name cannot be only spaces')
    .required('First name is required'),
  lastName: Yup.string()
    .max(35)
    .trim()
    .matches(/\S/, 'Last name cannot be only spaces')
    .required('Last name is required'),
  email: Yup.string().email('Invalid email address').required('Email is required'),
  password: Yup.string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters'),
  confirmPassword: Yup.string()
    .nullable()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Please confirm your password'),
  image: Yup.string().nullable().optional(),
  phoneNumber: Yup.string()
    .required('Phone number is required')
    .min(5, 'Minimum 5 digits required'),
});

// Creating separate schema for store vendor form
export const VendorSchemaForStoreForm = Yup.object().shape({
  name: Yup.string()
    .max(35)
    .trim()
    .matches(/\S/, 'Name cannot be only spaces')
    .required('Required'),
  email: Yup.string().email('Invalid email').required('Required'),
  password: Yup.string().required('Required'),
  confirmPassword: Yup.string()
    .nullable()
    .oneOf([Yup.ref('password'), null], 'Password must match')
    .required('Required'),
  image: Yup.string().nullable().optional(),
});

export const VendorEditSchema = Yup.object().shape({
  firstName: Yup.string()
    .trim()
    .matches(/\S/, 'First name cannot be only spaces')
    .required('First name is required'),
  lastName: Yup.string()
    .trim()
    .matches(/\S/, 'Last name cannot be only spaces')
    .required('Last name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().nullable().optional(),
  confirmPassword: Yup.string().nullable().optional(),
  image: Yup.string().nullable().optional(),
  phoneNumber: Yup.string()
    .required('Phone number is required')
    .min(5, 'Minimum 5 digits required'),
});
