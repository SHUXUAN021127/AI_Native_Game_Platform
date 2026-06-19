from jose import jwt, JWTError
from fastapi import HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/auth/login"
)

SECRET_KEY = "your-secret-key"
ALGORITHM = "HS256"


def decode_token(token: str):

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        return payload

    except JWTError:

        raise HTTPException(
            status_code=401,
            detail="Invalid Token"
        )


def get_current_user(
    token: str = Depends(oauth2_scheme)
):
    payload = decode_token(token)

    return payload