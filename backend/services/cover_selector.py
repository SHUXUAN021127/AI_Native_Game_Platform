import os


def select_best_cover(
    screenshots
):

    best = max(
        screenshots,
        key=os.path.getsize
    )

    return best