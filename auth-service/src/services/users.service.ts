import { Injectable } from '@nestjs/common'

@Injectable()
export class UsersService {
  getUserById() {
    return 'My name is Renato from K8s service!'
  }
}
