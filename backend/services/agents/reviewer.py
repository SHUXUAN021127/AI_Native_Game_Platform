def review_html(html: str):

    if "<html" not in html.lower():
        return False

    if "<script" not in html.lower():
        return False

    return True