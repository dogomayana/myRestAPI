CREATE TABLE customer_table(
    customer_id SERIAL,
    user_name TEXT UNIQUE PRIMARY KEY,
    email TEXT NOT NULL,
    phoneNo VARCHAR NOT NULL,
    customer_location POINT,
    order_count BIGINT  DEFAULT 0,
    customer_state TEXT,
    customer_city TEXT
);


INSERT INTO customer_table(user_name, email, phoneNo, customer_location, order_count, customer_state, customer_city)
VALUES('stephen', 'thomasstephen252@gmail.com', '08106264634', POINT(8.5648372, 4.5430515), 0, 'Kwara', 'Ilorin') RETURNING*;

CREATE TABLE customer_order_log(
    customer_log_id SERIAL,
    user_name TEXT REFERENCES customer_table(user_name),
    vendor_name TEXT,
    rider_name TEXT,
    customer_orders JSONB,
    order_time TIMESTAMP DEFAULT now()
);

INSERT INTO customer_order_log(user_name, vendor_name, rider_name, customer_orders)
VALUES('stephen','Tantalizer', 'One movement', '{"orders" : ["Rice", "Beans", "Spaghetti"]}') RETURNING*;

CREATE OR REPLACE FUNCTION place_order()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE customer_table
    SET order_count = order_count +1
    WHERE user_name = NEW.user_name;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_place_order_trigger
AFTER INSERT ON customer_order_log
FOR EACH ROW
EXECUTE FUNCTION place_order();


CREATE TABLE customer_details(
    customer_id SERIAL,
    act_number VARCHAR UNIQUE PRIMARY KEY,
    account_type TEXT NOT NULL,
    balance NUMERIC DEFAULT 0.00,
    bvn BIGINT NOT NULL,
    customer_city TEXT,
    customer_firstname TEXT,
    customer_lastname TEXT,
    customer_pswd TEXT,
    customer_state TEXT,
    email TEXT NOT NULL,
    phoneNo VARCHAR NOT NULL,
    created_at TIMESTAMP DEFAULT now()
);

INSERT INTO customer_details(act_number, account_type, balance, bvn, customer_city,customer_firstname, customer_lastname, customer_pswd, customer_state, email, phoneNo)
VALUES() RETURNING*;

CREATE TABLE transaction_log(
    transaction_id SERIAL,
    act_number VARCHAR REFERENCES customer_details(act_number),
    amount NUMERIC DEFAULT 0.00,
    balance NUMERIC DEFAULT 0.00,
    receiver_name TEXT,
    receiver_act VARCHAR,
    sender_name TEXT,
    sender_act VARCHAR,
    transaction_description TEXT,
    transaction_device TEXT,
    transaction_type VARCHAR(15),
    transfer_to VARCHAR,
    transaction_time TIMESTAMP DEFAULT now()
);

-- credit
INSERT INTO transaction_log(act_number, amount, credit_from, transaction_description, transaction_device, transaction_type)
VALUES('0987654321', 2000, '8106264634','transfer from 8999','POS', 'credit');
DELETE FROM transaction_log WHERE transaction_type = 'debit';
-- DEBIT
INSERT INTO transaction_log(act_number, amount, transfer_to, transaction_description, transaction_device, transaction_type)
VALUES('0987654321', 1000, '8106264634','debit from 8999','mobile app', 'debit');

CREATE OR REPLACE FUNCTION balance_check()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' AND NEW.balance < 0.00 THEN
        RAISE EXCEPTION 'Insufficient funds'
            USING HINT = 'Insufficient funds';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_balance
BEFORE UPDATE OF balance ON customer_details
FOR EACH ROW
EXECUTE FUNCTION balance_check();

-- Transaction logger trigger
CREATE OR REPLACE FUNCTION logger_func()
RETURNS TRIGGER AS $$
DECLARE
    new_balance NUMERIC;
    last_id INTEGER;
BEGIN
    IF TG_OP = 'INSERT' AND NEW.transaction_type = 'credit' THEN
        UPDATE customer_details SET balance = balance + NEW.amount
        WHERE act_number = NEW.act_number RETURNING balance INTO new_balance;

        UPDATE customer_details SET balance = balance - NEW.amount
        WHERE act_number = NEW.credit_from;

        SELECT MAX(transaction_id) INTO last_id FROM transaction_log WHERE credit_from = NEW.credit_from;
        UPDATE transaction_log SET balance = new_balance WHERE transaction_id = last_id;
    END IF;
    IF TG_OP = 'INSERT' AND NEW.transaction_type = 'debit' THEN
        UPDATE customer_details SET balance = balance - NEW.amount
        WHERE act_number = NEW.act_number RETURNING balance INTO new_balance;

        UPDATE customer_details SET balance = balance + NEW.amount
        WHERE act_number = NEW.transfer_to; 

        SELECT MAX(transaction_id) INTO last_id FROM transaction_log WHERE act_number = NEW.act_number;
        UPDATE transaction_log SET balance = new_balance WHERE transaction_id = last_id;

    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER logger_trigger
AFTER INSERT ON transaction_log
FOR EACH ROW
EXECUTE FUNCTION logger_func();