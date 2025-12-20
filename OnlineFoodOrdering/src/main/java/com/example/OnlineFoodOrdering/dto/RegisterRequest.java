package com.example.OnlineFoodOrdering.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class RegisterRequest {
    
    @NotBlank(message = "First name is required")
    private String firstName;
    
    @NotBlank(message = "Last name is required")
    private String lastName;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;
    
    private String phone;
    
    @NotBlank(message = "Password is required")
    private String password;
    
    private String role = "CUSTOMER";

    private Long locationId;

    public RegisterRequest() {
        this.role = "CUSTOMER";
    }
    
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    
    public String getRole() { return role != null ? role : "CUSTOMER"; }
    public void setRole(String role) { this.role = (role != null && !role.isEmpty()) ? role : "CUSTOMER"; }

    public Long getLocationId() { return locationId; }
    public void setLocationId(Long locationId) { this.locationId = locationId; }

    @Override
    public String toString() {
        return "RegisterRequest{firstName='" + firstName + "', lastName='" + lastName +
               "', email='" + email + "', phone='" + phone + "', role='" + role +
               "', locationId=" + locationId + "}";
    }
}
