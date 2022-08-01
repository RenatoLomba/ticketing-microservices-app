import { useForm } from 'react-hook-form'
import { z } from 'zod'

import {
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Heading,
  Input,
} from '@chakra-ui/react'
import { zodResolver } from '@hookform/resolvers/zod'

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

        <FormControl isInvalid={!!errors.name}>
          <FormLabel htmlFor="name">Full name</FormLabel>
          <Input
            type="text"
            id="name"
            placeholder="Your name"
            {...register('name')}
          />
          <FormErrorMessage>
            {errors.name && errors.name.message}
          </FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.name}>
          <FormLabel htmlFor="email">Email</FormLabel>
          <Input
            type="email"
            id="email"
            placeholder="Your email"
            {...register('email')}
          />
          <FormErrorMessage>
            {errors.email && errors.email.message}
          </FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.name}>
          <FormLabel htmlFor="password">Password</FormLabel>
          <Input
            type="password"
            id="password"
            placeholder="Your password"
            {...register('password')}
          />
          <FormHelperText>
            Password must contain at least 4 characters and a max of 20
            characters
          </FormHelperText>
          <FormErrorMessage>
            {errors.password && errors.password.message}
          </FormErrorMessage>
        </FormControl>

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
