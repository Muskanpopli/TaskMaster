CREATE TABLE items (
  id SERIAL PRIMARY KEY,
  title VARCHAR(100) NOT NULL
);

INSERT INTO items (title) VALUES ('Buy milk'), ('Finish homework');

CREATE TABLE daily_affirmation (
    date DATE PRIMARY KEY,
    affirmation_text TEXT
);

INSERT INTO daily_affirmation (date, affirmation_text)
VALUES ('2025-01-28', 'You are capable of achieving great things.');