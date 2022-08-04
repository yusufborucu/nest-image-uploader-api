import { HttpStatus } from "@nestjs/common";
import * as request from "supertest";

const app = 'http://localhost:3000';

describe('ROOT', () => {
  it('should ping', () => {
    return request(app)
      .get('/')
      .expect(HttpStatus.OK)
      .expect('Hello World!');
  });
});