-- Custom SQL migration file, put you code below! --
CREATE COLLATION IF NOT EXISTS ci (provider = 'icu', locale = 'en-US-u-ks-level2', deterministic = false);