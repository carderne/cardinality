#!/usr/bin/env python3

from dataclasses import dataclass
import sys

import pandas as pd
import numpy as np
import geopandas as gpd
from shapely.geometry import Point, LineString
import numba as nb


@dataclass
class Bearing:
    name: str
    angle: float

    @property
    def order(self):
        return 4 if "b" in self.name else len(self.name)

    def __lt__(self, other):
        return self.angle < other.angle


def prefix(new, move):
    q = int(new // 90)
    move = 0 if move < 0 else 1
    letters = ["NE", "ES", "SW", "WN"]
    return letters[q][move]


def split(bearing, move, by=False):
    new = (bearing.angle + move) % 360
    pre = prefix(new, move)
    name = f"{bearing.name}b{pre}" if by else f"{pre}{bearing.name}"
    return Bearing(name, new)


def make_all_bearings():
    cardinal = [Bearing(name, angle) for name, angle in zip("NESW", range(0, 360, 90))]
    move = 45
    inter = [
        split(b, m) for b in cardinal for m in [-move, move] if b.name not in ["N", "S"]
    ]
    move /= 2
    half = [split(b, m) for b in inter for m in [-move, move]]
    move /= 2
    quart = [split(b, m, by=True) for b in cardinal + inter for m in [-move, move]]
    bs = sorted(cardinal + inter + half + quart)
    return bs


def gdf2dict(gdf):
    all_pts = {}
    for _, row in gdf.iterrows():
        a = np.array(row.explode().geometry.exterior.coords)
        name = row["name"]
        if name == "Asia":
            a = np.where(a < -160, a + 360, a)
        if name in all_pts:
            all_pts[name] = np.concatenate((all_pts[name], a))
        else:
            all_pts[name] = a
    return all_pts


def get_poles(degs, all_pts):
    poles = {}
    for name, pts in all_pts.items():
        print(name, end=", ")
        a = calc_pts(degs, pts)
        if name == "Asia":
            a = np.where(a > 180, a - 360, a)
        poles[name] = a
    return poles


def poles2gdf(poles, bs, crs):
    dfs = [
        gpd.GeoDataFrame(
            data=[{"bearing": b.name, "order": b.order, "name": name} for b in bs],
            geometry=[Point(pt) for pt in pole],
            crs=crs,
        )
        for name, pole in poles.items()
    ]
    return pd.concat(dfs)


@nb.njit
def calc_pts(degs, coords):
    most_d = np.ones(len(degs)) * -1e9
    most_pt = np.ones((len(degs), 2)) * np.array((0.0, 0.0))

    for i in range(len(degs)):
        deg = degs[i]
        n_ratio = np.cos(np.deg2rad(deg))
        e_ratio = np.sin(np.deg2rad(deg))
        for c in range(len(coords)):
            dist = e_ratio * coords[c, 0] + n_ratio * coords[c, 1]
            if dist > most_d[i]:
                most_d[i] = dist
                most_pt[i, :] = coords[c]
    return most_pt


def make_perpendicular_lines(df):
    li = []
    for deg, (x, y) in df.iterrows():
        dx = np.sin(np.deg2rad(deg - 90)) * 5
        dy = np.cos(np.deg2rad(deg - 90)) * 5
        li.append(LineString([Point(x + dx, y + dy), Point(x - dx, y - dy)]))
    return df.assign(geometry=li)


def main(path_in, path_out):
    gdf = gpd.read_file(path_in)
    gdf = gdf.loc[(~pd.isna(gdf.name)) & (gdf.name != "ignore")]

    all_pts = gdf2dict(gdf)
    bs = make_all_bearings()
    degs = np.array([b.angle for b in bs], dtype=float)
    poles = get_poles(degs, all_pts)
    poles = poles2gdf(poles, bs, gdf.crs)

    poles.to_file(path_out, driver="GeoJSON")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
