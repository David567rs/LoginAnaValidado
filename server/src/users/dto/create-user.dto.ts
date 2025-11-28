import { IsEmail, IsNotEmpty, Matches, MinLength } from 'class-validator'

export class CreateUserDto {
  @IsNotEmpty()
  @Matches(/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]+$/, { message: 'Name must contain only letters and spaces' })
  name!: string

  @IsEmail()
  email!: string

  @MinLength(8)
  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/, {
    message: 'Password must have 8+ chars, 1 uppercase, 1 number and 1 special character',
  })
  password!: string
}

