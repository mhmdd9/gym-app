package com.github.mhmdd9.common.entity;

import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.Version;
import lombok.Getter;
import lombok.Setter;

/**
 * Base entity with optimistic locking support.
 * Use this for entities that need concurrency control (e.g., ClassSession, Reservation).
 */
@Getter
@Setter
@MappedSuperclass
public abstract class VersionedEntity extends BaseEntity {

    @Version
    @Column(name = "version", nullable = false)
    private Long version = 0L;
}

