package com.github.mhmdd9.auth.entity;

import com.github.mhmdd9.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "roles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Role extends BaseEntity {

    @Column(name = "name", nullable = false, unique = true, length = 50)
    private String name;

    @Column(name = "description")
    private String description;

    // Predefined role names
    public static final String ADMIN = "ADMIN";
    public static final String GYM_OWNER = "GYM_OWNER";
    public static final String MANAGER = "MANAGER";
    public static final String RECEPTIONIST = "RECEPTIONIST";
    public static final String TRAINER = "TRAINER";
    public static final String MEMBER = "MEMBER";
}

