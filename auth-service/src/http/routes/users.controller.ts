import { Controller, Get } from '@nestjs/common'

@Controller('/api/users')
export class UsersController {
  @Get('/current')
  currentUser() {
    return 'My name is Renato from K8s!'
  }
}
