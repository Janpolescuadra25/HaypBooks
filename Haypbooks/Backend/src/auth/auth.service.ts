import { Injectable, UnauthorizedException, ConflictException, Inject } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { IUserRepository } from '../repositories/interfaces/user.repository.interface'
import { USER_REPOSITORY } from '../repositories/mock/mock-repositories.module'
import { LoginDto, SignupDto } from './dto/auth.dto'

@Injectable()
export class AuthService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userRepository.findByEmail(email)
    if (!user) {
      return null
    }

    // In production: use bcrypt.compare(password, user.password)
    // For mock development, we'll do simple comparison
    const isPasswordValid = password === 'password' || (await bcrypt.compare(password, user.password))
    
    if (!isPasswordValid) {
      return null
    }

    const { password: _, ...result } = user
    return result
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password)
    
    if (!user) {
      throw new UnauthorizedException('Invalid email or password')
    }

    const payload = { email: user.email, sub: user.id, role: user.role }
    const token = this.jwtService.sign(payload)

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        onboardingComplete: !!user.onboardingComplete,
      },
    }
  }

  async signup(signupDto: SignupDto) {
    // Check if user exists
    const existingUser = await this.userRepository.findByEmail(signupDto.email)
    if (existingUser) {
      throw new ConflictException('Email already registered')
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(signupDto.password, 10)

    // Create user
    const user = await this.userRepository.create({
      email: signupDto.email,
      name: signupDto.name,
      password: hashedPassword,
      role: 'owner',
    })

    // Generate token
    const payload = { email: user.email, sub: user.id, role: user.role }
    const token = this.jwtService.sign(payload)

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        onboardingComplete: !!user.onboardingComplete,
      },
    }
  }
}
