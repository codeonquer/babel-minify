"use strict";

module.exports = function bfsTraverseCreator({ types: t, traverse }) {
  function getFields(path) {
    // 通过 t.VISITOR_KEYS 中的定义，确定一个定义通过什么属性获得子节点
    // 比如输入 VariableDeclaration
    // 获得 ['declarations']
    // 返回的是一个数组，这也是定义中子节点执行的顺序
    return t.VISITOR_KEYS[path.type];
  }

  return function bfsTraverse(path, _visitor) {
    if (!path.node) {
      throw new Error("Not a valid path");
    }

    /**
     * traverse.explode 将自己编写的 visitor 进行验证、展开
     * 比如，平展 enter exit 方法等
     * 比如，平展一些别名的定义，比如将 Scopable 展开成实际的定义
     * 变成最终用来处理的函数
     */
    const visitor = traverse.explode(_visitor);

    const queue = [path];
    let current;

    while (queue.length > 0) {
      current = queue.shift();

      // call
      if (
        visitor &&
        visitor[current.type] &&
        Array.isArray(visitor[current.type].enter)
      ) {
        const fns = visitor[current.type].enter;
        for (const fn of fns) {
          if (typeof fn === "function") fn(current);
        }
      }

      const fields = getFields(current);

      for (const field of fields) {
        const child = current.get(field);

        if (Array.isArray(child)) {
          // visit container left to right
          for (const c of child) {
            if (c.node) queue.push(c);
          }
        } else {
          if (child.node) queue.push(child);
        }
      }
    }
  };
};
