import * as mongoose from "mongoose";
import axios from "axios";
import * as request from "supertest";
import { HttpStatus } from "@nestjs/common";
import { AuthDTO } from "../src/auth/auth.dto";
import { ConfigModule } from '@nestjs/config';
ConfigModule.forRoot();

const app = 'http://localhost:3000';

const user: AuthDTO = {
  email: 'test@gmail.com',
  password: '123456'
};

let userToken: string;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await mongoose.connection.db.dropDatabase();

  const {data: { token }} = await axios.post(`${app}/auth/register`, user);
  userToken = token;
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('IMAGE', () => {
  let imageId: string;

  it('should create image', () => {
    return request(app)
      .post('/image')
      .set('Authorization', `Bearer ${userToken}`)
      .attach('file', __dirname + '/test.png')
      .field("note", "test")
      .expect(({ body }) => {
        imageId = body._id;
        expect(body.owner.email).toEqual(user.email);
        expect(body.link).toBeDefined();
        expect(body.note).toEqual("test");
        expect(body.createdAt).toBeDefined();
      })
      .expect(HttpStatus.CREATED);
  });

  it('should list user images', () => {
    return request(app)
      .get('/image')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(({ body }) => {
        expect(body.length).toEqual(1);
      })
      .expect(HttpStatus.OK);
  });

  it('should update image', () => {
    return request(app)
      .put(`/image/${imageId}`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ note: 'new note' })
      .expect(({ body }) => {
        expect(body.owner.email).toEqual(user.email);
        expect(body.link).toBeDefined();
        expect(body.note).toEqual("new note");
        expect(body.createdAt).toBeDefined();
      })
      .expect(HttpStatus.OK);
  });

  it('should delete image', async () => {
    await axios.delete(`${app}/image/${imageId}`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });

    return request(app)
      .get(`/image/${imageId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(HttpStatus.NO_CONTENT);
  });
});