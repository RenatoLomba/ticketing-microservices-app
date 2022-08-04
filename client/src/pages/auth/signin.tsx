import { AxiosError } from 'axios'
import { useRouter } from 'next/router'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button, Flex, Heading, useToast } from '@chakra-ui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'

import { useAuth } from '../_app'
import { FormInput } from '../../components/form-input'
import { getApi } from '../../lib/api'
import {
  handleErrorMessage,
  ResponseErrorData,
} from '../../utils/handle-error-message'

const signInFormSchemaValidation = z.object({
  email: z.string().email(),
  password: z.string().min(4).max(20),
})

type SignInFormFields = z.infer<typeof signInFormSchemaValidation>

type SignInResponseData = {
  access_token: string
  refresh_token: string
  user: {
    id: string
    name: string
    email: string
  }
}

export default function SignInPage() {
  const { sign } = useAuth()
  const router = useRouter()
  const toast = useToast({
    duration: 9000,
    isClosable: true,
    position: 'top-right',
  })

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SignInFormFields>({
    resolver: zodResolver(signInFormSchemaValidation),
  })

  const { mutateAsync: signInUser } = useMutation(
    async (data: SignInFormFields) => {
      const { data: responseData } = await getApi().post<SignInResponseData>(
        '/api/users/signin',
        data,
      )

      return responseData
    },
    {
      onSuccess(data) {
        sign(data)
        reset()
        router.push('/')
      },
      onError(error: AxiosError<ResponseErrorData>) {
        handleErrorMessage(error, (errorData) => {
          toast({
            title: errorData.error,
            description: errorData.message,
            status: 'error',
          })
        })
      },
    },
  )

  async function handleSignInFormSubmit(data: SignInFormFields) {
    await signInUser(data)
  }

  return (
    <Flex
      h="calc(100vh - 60px)"
      w="100%"
      justify="center"
      align="center"
      px="6"
    >
      <Flex
        onSubmit={handleSubmit(handleSignInFormSubmit)}
        as="form"
        maxW={720}
        w="100%"
        bg="gray.900"
        borderRadius="md"
        p={{ base: '6', md: '10' }}
        flexDir="column"
        gap="6"
      >
        <Heading mb="6">Sign In</Heading>

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
