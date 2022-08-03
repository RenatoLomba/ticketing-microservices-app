import { AxiosError } from 'axios'
import { useRouter } from 'next/router'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button, Flex, Heading, useToast } from '@chakra-ui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'

import { FormInput } from '../../components/form-input'
import { getApi } from '../../lib/api'
import { setAccessToken, setRefreshToken } from '../../utils/cookies'

const signUpFormSchemaValidation = z.object({
  name: z.string().min(5),
  email: z.string().email(),
  password: z.string().min(4).max(20),
})

type SignUpFormFields = z.infer<typeof signUpFormSchemaValidation>

type SignUpResponseData = {
  access_token: string
  refresh_token: string
  user: {
    id: string
    name: string
    email: string
  }
}

export default function SignUpPage() {
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
  } = useForm<SignUpFormFields>({
    resolver: zodResolver(signUpFormSchemaValidation),
  })

  const { mutateAsync: signUpUser } = useMutation(
    async (data: SignUpFormFields) => {
      const { data: responseData } = await getApi().post<SignUpResponseData>(
        '/api/users/signup',
        data,
      )

      return responseData
    },
    {
      onSuccess(data) {
        setAccessToken(data.access_token)
        setRefreshToken(data.refresh_token)

        reset()

        router.push('/')
      },
      onError(
        error: AxiosError<{ error: string; message: string | string[] }>,
      ) {
        if (typeof error.response?.data.message === 'string') {
          toast({
            title: error.response?.data.error,
            description: error.response?.data.message,
            status: 'error',
          })
        } else {
          error.response?.data.message.forEach((errorMessage) => {
            toast({
              title: error.response?.data.error,
              description: errorMessage,
              status: 'error',
            })
          })
        }
      },
    },
  )

  async function handleSignUpFormSubmit(data: SignUpFormFields) {
    await signUpUser(data)
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
