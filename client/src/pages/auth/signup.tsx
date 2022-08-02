import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button, Flex, Heading } from '@chakra-ui/react'
import { zodResolver } from '@hookform/resolvers/zod'

import { FormInput } from '../../components/form-input'

const signUpFormSchemaValidation = z.object({
  name: z.string().min(5),
  email: z.string().email(),
  password: z.string().min(4).max(20),
})

type SignUpFormFields = z.infer<typeof signUpFormSchemaValidation>

export default function SignUpPage() {
  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormFields>({
    resolver: zodResolver(signUpFormSchemaValidation),
  })

  async function handleSignUpFormSubmit(data: SignUpFormFields) {
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        console.log(data)
        resolve()
      }, 1000)
    })
  }

  return (
    <Flex minH="100vh" w="100%" justify="center" align="center" px="6">
      <Flex
        onSubmit={handleSubmit(handleSignUpFormSubmit)}
        as="form"
        maxW={720}
        w="100%"
        bg="gray.900"
        borderRadius="md"
        p={{ base: '6', md: '10' }}
        flexDir="column"
        gap="6"
      >
        <Heading mb="6">Sign up</Heading>

        <FormInput
          label="Full name"
          placeholder="Your name"
          isInvalid={!!errors.name}
          errorMessage={errors.name?.message}
          {...register('name')}
        />

        <FormInput
          label="Email"
          placeholder="Your email"
          type="email"
          isInvalid={!!errors.email}
          errorMessage={errors.email?.message}
          {...register('email')}
        />

        <FormInput
          label="Password"
          type="password"
          placeholder="Your password"
          isInvalid={!!errors.password}
          errorMessage={errors.password?.message}
          {...register('password')}
          helperText="Password must contain at least 4 characters and a max of 20
          characters"
        />

        <Button
          mt="4"
          type="submit"
          colorScheme="pink"
          isLoading={isSubmitting}
        >
          Submit
        </Button>
      </Flex>
    </Flex>
  )
}
