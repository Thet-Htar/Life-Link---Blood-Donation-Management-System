/*
 @Column(nullable = false)
    private String fullName;

    @Column(nullable = false, unique = true)
    private String email;

    private String password;

    @Column(nullable = false, unique = true)
    private String phone;

    @Enumerated(EnumType.STRING)
    private Role role;

*/

export interface User {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  role: Role;
  address?: Address;
}

export interface Address {
  city: string;
  township: string;
  street?: string;
}

export type AccountModalType = "UNDER_REVIEW" | "REJECTED" | null;

/*
public enum Role {
    ADMIN,
    DONOR,
    HOSPITAL_STAFF
}
*/

export const AccountModalType = {
  ADMIN: "ADMIN",
  DONOR: "DONOR",
  HOSPITAL_STAFF: "HOSPITAL_STAFF",
} as const;

export type Role = (typeof AccountModalType)[keyof typeof AccountModalType];
