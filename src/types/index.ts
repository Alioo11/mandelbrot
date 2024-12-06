export type Tuple2<T> = [T, T];
export type Tuple3<T> = [T, T, T];
export type Tuple4<T> = [T, T, T, T];

export type Vector2 = Tuple2<number>;
export type Vector3 = Tuple3<number>;
export type Vector4 = Tuple4<number>;

export type Matrix2x2 = Tuple2<Vector2>;
export type Matrix3x3 = Tuple3<Vector3>;
export type Matrix4x4 = Tuple4<Vector4>;
