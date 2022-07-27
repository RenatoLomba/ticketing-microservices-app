import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export const CurrentUser = createParamDecorator(
  (_: unknown, context: ExecutionContext) => {
    const httpContext = context.switchToHttp()
    return httpContext.getRequest().user
  },
)
