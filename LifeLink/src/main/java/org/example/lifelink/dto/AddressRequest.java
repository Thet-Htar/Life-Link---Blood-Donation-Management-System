package org.example.lifelink.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AddressRequest(

        @NotBlank(message = "City is required")
        @Size(min = 2, max = 100, message = "City must contain between 2 and 100 characters")
        String city,

        @NotBlank(message = "Township is required")
        @Size(min = 2, max = 100, message = "Township must contain between 2 and 100 characters")
        String township,

        @Size(max = 255, message = "Street must not exceed 255 characters")
        String street
) {
}