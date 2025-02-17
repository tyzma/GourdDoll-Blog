import ControllerBase from "../controllerBase";
import TableSearch from "../../model/common/tableSearch";

class StatisticsController extends ControllerBase {
  /**
   * 获取博客分类统计
   */
  getCategoryBlogs() {
    return this.request.get<any>("/blog/statistics/getCategoryBlogs");
  }
}

export default StatisticsController;
