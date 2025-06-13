import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    accessToken?: string
    backendToken?: string
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string
    backendToken?: string
    id?: string
  }
}
