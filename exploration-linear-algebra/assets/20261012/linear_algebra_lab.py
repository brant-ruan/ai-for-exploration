#!/usr/bin/env python3
"""Six deterministic linear algebra labs using NumPy and synthetic data only.

Run: python3 linear_algebra_lab.py
Requires: Python 3.10+ and NumPy. No network, datasets, model weights or plotting.
The printed quantities illustrate mathematics, not an LLM or security benchmark.
"""

from __future__ import annotations

import numpy as np


SEED = 20261012


def softmax_rows(logits: np.ndarray) -> np.ndarray:
    shifted = logits - np.max(logits, axis=-1, keepdims=True)
    exponentials = np.exp(shifted)
    return exponentials / exponentials.sum(axis=-1, keepdims=True)


def heading(number: int, title: str) -> None:
    print(f"\n实验 {number}: {title}")


def experiment_1_least_squares_and_ridge() -> None:
    heading(1, "最小二乘与 ridge：残差正交、截距不受惩罚")
    # This is a new affine regression example, different from chapter 04.
    design = np.array([[1.0, 1.0], [1.0, 2.0], [1.0, 3.0]])
    target = np.array([1.0, 2.0, 2.0])
    coefficient, _, _, _ = np.linalg.lstsq(design, target, rcond=None)
    residual = design @ coefficient - target
    assert np.allclose(coefficient, [2.0 / 3.0, 0.5])
    assert np.allclose(design.T @ residual, 0.0)
    assert np.allclose(residual @ residual, 1.0 / 6.0)

    # Here lambda = 1 and only the slope is penalized.
    penalty = np.diag([0.0, 1.0])
    ridge = np.linalg.solve(design.T @ design + penalty, design.T @ target)
    ridge_residual = design @ ridge - target
    assert np.allclose(ridge, [1.0, 1.0 / 3.0])
    assert np.allclose(design.T @ ridge_residual + penalty @ ridge, 0.0)

    # A dependent design has many coefficient solutions; lstsq picks min norm.
    dependent = np.array([[1.0, 1.0], [2.0, 2.0], [3.0, 3.0]])
    minimum_norm = np.linalg.lstsq(dependent, [1.0, 2.0, 3.0], rcond=None)[0]
    assert np.allclose(minimum_norm, [0.5, 0.5])
    print("LS [截距, 斜率] =", coefficient, "; SSE =", residual @ residual)
    print("ridge lambda=1 [截距, 斜率] =", ridge)
    print("相关列的最小范数解 =", minimum_norm, "; 系数可不唯一而预测相同")


def experiment_2_pca_whitening_mahalanobis() -> None:
    heading(2, "PCA、白化与 Mahalanobis：换度量会改变距离排序")
    # Four centered observations with unbiased sample covariance diag(9, 1).
    a, b = np.sqrt(13.5), np.sqrt(1.5)
    observations = np.array([[a, 0.0], [-a, 0.0], [0.0, b], [0.0, -b]])
    mean = observations.mean(axis=0)
    centered = observations - mean
    covariance = centered.T @ centered / (len(observations) - 1)
    assert np.allclose(covariance, np.diag([9.0, 1.0]))
    eigenvalues, eigenvectors = np.linalg.eigh(covariance)
    order = np.argsort(eigenvalues)[::-1]
    eigenvalues, eigenvectors = eigenvalues[order], eigenvectors[:, order]
    whitening = np.diag(eigenvalues ** -0.5) @ eigenvectors.T
    whitened = centered @ whitening.T
    white_covariance = whitened.T @ whitened / (len(observations) - 1)
    assert np.allclose(white_covariance, np.eye(2))

    query = np.array([[3.0, 0.0], [0.0, 2.0]])
    distance_squared = np.einsum(
        "ij,ij->i", query, np.linalg.solve(covariance, query.T).T
    )
    assert np.allclose(distance_squared, [1.0, 4.0])
    assert np.allclose(np.sum((query @ whitening.T) ** 2, axis=1), distance_squared)

    # Centering limits rank by n-1, even when there are d=5 features.
    wide = np.column_stack((centered, centered[:, 0], centered[:, 1], centered.sum(axis=1)))
    assert np.linalg.matrix_rank(wide) <= min(5, len(wide) - 1)
    assert np.linalg.matrix_rank(wide.T @ wide) == 2
    print("样本协方差 =\n", covariance)
    print("PCA 特征值 =", eigenvalues, "; 第一方向解释方差比例 =", eigenvalues[0] / eigenvalues.sum())
    print("白化后样本协方差 =\n", white_covariance)
    print("点 (3,0)、(0,2) 的欧氏距离 =", np.linalg.norm(query, axis=1))
    print("这两个点的 Mahalanobis 距离平方 =", distance_squared)
    print("4 个样本、5 个特征的协方差秩 =", np.linalg.matrix_rank(wide.T @ wide))


def experiment_3_svd_and_low_rank() -> None:
    heading(3, "SVD 与低秩：保留大能量不保证保留安全语义")
    matrix = np.diag([4.0, 2.0, 1.0])
    left, singular_values, right_transpose = np.linalg.svd(matrix, full_matrices=False)
    rank_one = (left[:, :1] * singular_values[:1]) @ right_transpose[:1, :]
    rank_two = (left[:, :2] * singular_values[:2]) @ right_transpose[:2, :]
    assert np.linalg.matrix_rank(rank_one) == 1
    assert np.allclose(np.linalg.norm(matrix - rank_one, "fro") ** 2, 5.0)
    assert np.allclose(np.linalg.norm(matrix - rank_two, "fro") ** 2, 1.0)
    assert np.allclose(np.linalg.norm(matrix - rank_one, 2), 2.0)

    # A low-rank weight update, with column-vector convention.
    factor_a = np.array([[1.0, 0.0, -1.0]])  # (r=1, input=3)
    factor_b = np.array([[2.0], [1.0]])       # (output=2, r=1)
    update = factor_b @ factor_a
    assert np.linalg.matrix_rank(update) == 1
    assert np.allclose(update, [[2.0, 0.0, -2.0], [1.0, 0.0, -1.0]])
    print("奇异值 =", singular_values)
    print("rank-1 重建 Frobenius 误差平方 =", np.linalg.norm(matrix - rank_one, "fro") ** 2)
    print("rank-2 重建 Frobenius 误差平方 =", np.linalg.norm(matrix - rank_two, "fro") ** 2)
    print("LoRA 形式 B@A 更新 =\n", update)


def experiment_4_attention() -> None:
    heading(4, "attention：分数、mask 与 value 是不同对象")
    query = np.eye(2)
    key = np.eye(2)
    value = np.array([[2.0, 0.0], [0.0, 4.0]])
    logits = query @ key.T / np.sqrt(query.shape[-1])
    weights = softmax_rows(logits)
    output = weights @ value
    assert weights.shape == (2, 2) and output.shape == (2, 2)
    assert np.allclose(weights.sum(axis=1), 1.0)
    assert np.allclose(weights[0], [0.6697615493266569, 0.3302384506733431])
    assert np.allclose(output[0], [1.3395230986533138, 1.3209538026933724])

    causal_mask = np.triu(np.ones((2, 2), dtype=bool), k=1)
    causal_logits = np.where(causal_mask, -np.inf, logits)
    causal_weights = softmax_rows(causal_logits)
    assert np.allclose(causal_weights[0], [1.0, 0.0])
    assert np.allclose(causal_weights[1], weights[1])
    assert np.allclose(softmax_rows(logits + 10000.0), weights)

    # The same attention weights can produce entirely different output content.
    alternate_value = -value
    assert np.allclose(weights @ alternate_value, -output)
    print("未加 mask 的 attention 权重 =\n", weights)
    print("对应输出 =\n", output)
    print("causal mask 后权重 =\n", causal_weights)
    print("保持权重、把 V 取负，输出也取负；权重本身不说明授权")


def experiment_5_projection_steering_anisotropy() -> None:
    heading(5, "方向干预与各向异性：投影性质、坐标与因果结论")
    direction = np.array([1.0, 1.0]) / np.sqrt(2.0)
    hidden = np.array([3.0, 1.0])
    projector = np.eye(2) - np.outer(direction, direction)
    ablated = projector @ hidden
    steered = hidden + direction
    assert np.allclose(projector.T, projector)
    assert np.allclose(projector @ projector, projector)
    assert np.allclose(ablated, [1.0, -1.0])
    assert np.allclose(direction @ ablated, 0.0)
    assert np.isclose(np.linalg.norm(hidden - ablated), abs(direction @ hidden))

    whitening = np.diag([1.0 / 3.0, 1.0])
    mean_difference = np.array([1.0, 1.0])
    transformed_difference = whitening @ mean_difference
    transformed_difference /= np.linalg.norm(transformed_difference)
    assert np.allclose(transformed_difference, [1.0 / np.sqrt(10.0), 3.0 / np.sqrt(10.0)])

    # A feature difference transforms as a vector; a probe normal as a covector.
    probe_normal = np.array([1.0, 1.0])
    white_normal = np.linalg.solve(whitening.T, probe_normal)
    white_hidden = whitening @ hidden
    assert np.isclose(probe_normal @ hidden, white_normal @ white_hidden)

    # A random control can be generated reproducibly but says nothing about an LLM.
    random_control = np.random.default_rng(SEED).normal(size=2)
    random_control /= np.linalg.norm(random_control)
    print("h =", hidden, "; 移除 u 后 =", ablated, "; 加入一个 u 后 =", steered)
    print("原坐标单位均值差方向 =", direction)
    print("白化坐标单位均值差方向 =", transformed_difference)
    print("原 probe 法向量 =", probe_normal, "; 白化后保持同一分数的法向量 =", white_normal)
    print("固定 seed 随机方向对照 =", random_control)


def experiment_6_gradients_and_perturbations() -> None:
    heading(6, "局部梯度与扰动：有限差分、线性化与范数约束")
    weight = np.array([[2.0, 0.0], [1.0, 1.0]])
    hidden = np.array([1.0, 2.0])
    target = np.array([1.0, 1.0])

    def loss(vector: np.ndarray) -> float:
        residual = weight @ vector - target
        return float(0.5 * residual @ residual)

    gradient = weight.T @ (weight @ hidden - target)
    finite_difference = np.empty_like(hidden)
    step = 1e-6
    for coordinate in range(len(hidden)):
        perturbation = np.zeros_like(hidden)
        perturbation[coordinate] = step
        finite_difference[coordinate] = (loss(hidden + perturbation) - loss(hidden - perturbation)) / (2.0 * step)
    assert np.allclose(gradient, [4.0, 2.0])
    assert np.allclose(gradient, finite_difference, atol=1e-8)

    epsilon = 0.1
    perturbation = epsilon * np.sign(gradient)
    linearized_increase = gradient @ perturbation
    actual_increase = loss(hidden + perturbation) - loss(hidden)
    remainder = 0.5 * np.linalg.norm(weight @ perturbation) ** 2
    assert np.isclose(loss(hidden), 2.5)
    assert np.isclose(actual_increase, 0.64)
    assert np.isclose(actual_increase, linearized_increase + remainder)
    assert np.linalg.norm(weight @ perturbation) <= np.linalg.norm(weight, 2) * np.linalg.norm(perturbation) + 1e-12

    classifier_normal = np.array([1.0, -2.0, 1.0])
    features = np.array([0.4, 0.0, 0.0])
    budget = 0.11
    worst_direction = -budget * np.sign(classifier_normal)
    margin_before = classifier_normal @ features
    margin_after = classifier_normal @ (features + worst_direction)
    assert np.isclose(margin_before, 0.4)
    assert np.isclose(margin_after, -0.04)
    assert np.isclose(margin_before - margin_after, budget * np.linalg.norm(classifier_normal, 1))
    print("解析梯度 =", gradient, "; 有限差分梯度 =", finite_difference)
    print("损失变化：一阶预测 =", linearized_increase, "; 实际 =", actual_increase)
    print("二阶余项 =", remainder)
    print("三维线性分类器 margin：", margin_before, "->", margin_after)
    print("特征扰动是合成连续变量；没有构造文本、网络流量或真实攻击")


def main() -> None:
    np.set_printoptions(precision=6, suppress=True)
    print("线性代数教程：6 个 NumPy 合成实验，seed =", SEED)
    experiment_1_least_squares_and_ridge()
    experiment_2_pca_whitening_mahalanobis()
    experiment_3_svd_and_low_rank()
    experiment_4_attention()
    experiment_5_projection_steering_anisotropy()
    experiment_6_gradients_and_perturbations()
    print("\n全部数学断言通过。结果仅说明这些指定合成例子的性质。")


if __name__ == "__main__":
    main()
