import { HttpStatus } from "@nestjs/common";
import * as mongoose from "mongoose";
import * as request from "supertest";
import { AuthDTO, ForgotDTO, ResetDTO } from "../src/auth/auth.dto";
import { ConfigModule } from '@nestjs/config';
ConfigModule.forRoot();

const app = 'http://localhost:3000';

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await mongoose.connection.db.dropDatabase();
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('AUTH', () => {
  const user: AuthDTO = {
    email: 'test@gmail.com',
    password: '123456'
  };

  let token: string;

  const forgotData: ForgotDTO = {
    email: 'test@gmail.com'
  };

  const forgotDataNonUser: ForgotDTO = {
    email: 'nonuser@gmail.com'
  };

  const resetData: ResetDTO = {
    resetHash: '',
    password: '123123'
  };

  const resetDataNonUser: ResetDTO = {
    resetHash: 'xxx',
    password: '123123'
  };

  it('should register user', () => {
    return request(app)
      .post('/auth/register')
      .set('Accept', 'application/json')
      .send(user)
      .expect(({ body}) => {
        expect(body.token).toBeDefined();
        expect(body.user.email).toEqual(user.email);
        expect(body.user.password).toBeUndefined();
        expect(body.user.createdAt).toBeDefined();
      })
      .expect(HttpStatus.CREATED);
  });

  it('should reject duplicate register', () => {
    return request(app)
      .post('/auth/register')
      .set('Accept', 'application/json')
      .send(user)
      .expect(({ body }) => {
        expect(body.message).toEqual('User already exists');
        expect(body.code).toEqual(HttpStatus.BAD_REQUEST);
      })
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('should login user', () => {
    return request(app)
      .post('/auth/login')
      .set('Accept', 'application/json')
      .send(user)
      .expect(({ body }) => {
        token = body.token;
        expect(body.token).toBeDefined();
        expect(body.user.email).toEqual(user.email);
        expect(body.user.password).toBeUndefined();
        expect(body.user.createdAt).toBeDefined();
      })
      .expect(HttpStatus.CREATED);
  });

  it('should respect user token', () => {
    return request(app)
      .get('/auth')
      .set('Authorization', `Bearer ${token}`)
      .expect(HttpStatus.OK);
  });

  it('should send reset password mail', () => {
    return request(app)
      .post('/auth/forgot_password')
      .set('Accept', 'application/json')
      .send(forgotData)
      .expect(({ body }) => {
        resetData.resetHash = body.resetHash;
        expect(body.message).toEqual("Reset password email sent");
        expect(body.resetHash).toBeDefined();
      })
      .expect(HttpStatus.OK);
  });

  it('should reject to send mail to non user', () => {
    return request(app)
      .post('/auth/forgot_password')
      .set('Accept', 'application/json')
      .send(forgotDataNonUser)
      .expect(({ body }) => {
        expect(body.message).toEqual("User not found");
        expect(body.resetHash).toBeUndefined();
      })
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('should change user password', () => {
    return request(app)
      .post('/auth/reset_password')
      .set('Accept', 'application/json')
      .send(resetData)
      .expect(({ body }) => {
        expect(body.message).toEqual("Your password changed successfully");
      })
      .expect(HttpStatus.OK);
  });

  it('should reject to change password for non user', () => {
    return request(app)
      .post('/auth/reset_password')
      .set('Accept', 'application/json')
      .send(resetDataNonUser)
      .expect(({ body }) => {
        expect(body.message).toEqual("User not found");
      })
      .expect(HttpStatus.BAD_REQUEST);
  });
});