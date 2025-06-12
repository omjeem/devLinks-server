import { boolean, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { InferSelectModel, relations } from "drizzle-orm";


export const users = pgTable("users", {
    id: varchar().unique(),
    userName: varchar().unique(),
    email: varchar().unique(),
    password: varchar(),
    name: varchar(),
    signMethod: varchar(),
    isVerified: boolean(),
    createdAt: timestamp().defaultNow(),
})

export const links = pgTable("links", {
    id: varchar().unique(),
    userId: varchar().references(() => users.id),
    field: varchar().notNull(),
    value: varchar().notNull(),
    createdAt: timestamp().defaultNow(),
})

export const userRelations = relations(users, ({ many }) => ({
    links: many(links)
}))

export const linksRelations = relations(links, ({ one }) => ({
    user: one(users, {
        fields: [links.userId],
        references: [users.id]
    })
}))

export type UsersModal = InferSelectModel<typeof users>;