import { forwardRef, ForwardRefRenderFunction } from 'react'

import {
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input,
  InputProps,
} from '@chakra-ui/react'

type FormInputProps = InputProps & {
  label: string
  helperText?: string
  isInvalid?: boolean
  errorMessage?: string
}

const BaseFormInput: ForwardRefRenderFunction<
  HTMLInputElement,
  FormInputProps
> = (
  {
    name,
    type = 'text',
    isInvalid = false,
    errorMessage,
    label,
    helperText,
    ...props
  },
  ref,
) => {
  return (
    <FormControl isInvalid={isInvalid}>
      {label && <FormLabel htmlFor={name}>{label}</FormLabel>}
      <Input ref={ref} type={type} id={name} name={name} {...props} />
      {helperText && (
        <FormHelperText>
          Password must contain at least 4 characters and a max of 20 characters
        </FormHelperText>
      )}
      <FormErrorMessage>{errorMessage}</FormErrorMessage>
    </FormControl>
  )
}

export const FormInput = forwardRef(BaseFormInput)
