import type { Password, User } from "@prisma/client";
import bcrypt from "bcryptjs";
import { GraphQLClient, gql } from "graphql-request";

import { prisma } from "~/db.server";

export type { User } from "@prisma/client";

export type Author = {
  name: string;
  intro: string;
  slug: string;
};

export function slugify(name: String) {
  return name
    .toString()
    .normalize("NFKD")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

export async function getUserById(id: User["id"]) {
  return prisma.user.findUnique({ where: { id } });
}

export async function getUserByEmail(email: User["email"]) {
  return prisma.user.findUnique({ where: { email } });
}

export async function createUser(
  email: User["email"],
  password: string,
  name: string,
  intro: string
) {
  const hashedPassword = await bcrypt.hash(password, 10);

  // Associate the user with a newly created Author in GraphCMS. 
  const endpoint = "https://api.graph.cool/simple/v1/cixos23120m0n0173veiiwrjr";

  const graphQLClient = new GraphQLClient(endpoint, {
    headers: {
      authorization: "Bearer " + process.env.WRITE_TOKEN,
    },
  });

  const mutation = gql`
  mutation {
    createAuthor($name: String!, $intro: String!, $bio: String!, $slug: String!) {
      id
    }
  }`;

  const authorInput: Author = {
    name: name,
    intro: intro,
    slug: slugify(name),
  };

  const authorId = await graphQLClient.request(mutation, authorInput);

  return prisma.user.create({
    data: {
      email,
      password: {
        create: {
          hash: hashedPassword,
        },
      },
      authorId: authorId,
    },
  });
}

export async function deleteUserByEmail(email: User["email"]) {
  return prisma.user.delete({ where: { email } });
}

export async function verifyLogin(
  email: User["email"],
  password: Password["hash"]
) {
  const userWithPassword = await prisma.user.findUnique({
    where: { email },
    include: {
      password: true,
    },
  });

  if (!userWithPassword || !userWithPassword.password) {
    return null;
  }

  const isValid = await bcrypt.compare(
    password,
    userWithPassword.password.hash
  );

  if (!isValid) {
    return null;
  }

  const { password: _password, ...userWithoutPassword } = userWithPassword;

  return userWithoutPassword;
}
